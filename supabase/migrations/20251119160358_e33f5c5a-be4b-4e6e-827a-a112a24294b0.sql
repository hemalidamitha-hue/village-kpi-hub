-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'department_head', 'employee', 'quality_circle_leader');

-- Create enum for departments
CREATE TYPE department_type AS ENUM ('sales_marketing', 'warehouse', 'procurement', 'quality_assurance', 'research_development', 'production');

-- Create enum for KPI status
CREATE TYPE kpi_status AS ENUM ('pending', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  department department_type,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create KPI records table
CREATE TABLE public.kpi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department department_type NOT NULL,
  expected_defects INTEGER NOT NULL,
  actual_defects INTEGER NOT NULL,
  defect_percentage DECIMAL(5,2) GENERATED ALWAYS AS ((actual_defects::DECIMAL / NULLIF(expected_defects, 0)) * 100) STORED,
  variance INTEGER GENERATED ALWAYS AS (actual_defects - expected_defects) STORED,
  reason_for_defects TEXT,
  corrective_action TEXT,
  responsible_officer TEXT,
  status kpi_status DEFAULT 'pending',
  entry_date DATE NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quality circle meetings table
CREATE TABLE public.quality_circle_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  departments department_type[] NOT NULL,
  report_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES public.quality_circle_meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_department department_type,
  status kpi_status DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create recognition table
CREATE TABLE public.recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recognition_type TEXT NOT NULL,
  recipient_id UUID REFERENCES public.profiles(id),
  recipient_department department_type,
  reason TEXT NOT NULL,
  month DATE NOT NULL,
  nominated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_circle_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for KPI records
CREATE POLICY "Users can view KPI records" ON public.kpi_records FOR SELECT USING (true);
CREATE POLICY "Employees can insert KPI records" ON public.kpi_records 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND department = kpi_records.department)
  );
CREATE POLICY "Department heads can update KPI records" ON public.kpi_records 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'department_head') AND department = kpi_records.department)
  );

-- RLS Policies for quality circle meetings
CREATE POLICY "Users can view meetings" ON public.quality_circle_meetings FOR SELECT USING (true);
CREATE POLICY "Quality circle leaders can create meetings" ON public.quality_circle_meetings 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'quality_circle_leader'))
  );

-- RLS Policies for tasks
CREATE POLICY "Users can view tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Users can update assigned tasks" ON public.tasks 
  FOR UPDATE USING (
    assigned_to = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'quality_circle_leader'))
  );

-- RLS Policies for recognitions
CREATE POLICY "Users can view recognitions" ON public.recognitions FOR SELECT USING (true);
CREATE POLICY "Department heads can create recognitions" ON public.recognitions 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'department_head'))
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_kpi_records_updated_at BEFORE UPDATE ON public.kpi_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_quality_circle_meetings_updated_at BEFORE UPDATE ON public.quality_circle_meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();