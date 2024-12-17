-- Vytvoření tabulek pro evaluační systém

-- Školy
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Uživatelé (pouze administrátoři a ředitelé)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password_hash VARCHAR(255) NOT NULL CHECK (LENGTH(password_hash) >= 60),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'director')),
    school_id INTEGER REFERENCES schools(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Třídy
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    school_id INTEGER REFERENCES schools(id),
    director_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT director_role_check CHECK (
        director_id IN (SELECT id FROM users WHERE role = 'director')
    )
);

-- Učitelé
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    school_id INTEGER REFERENCES schools(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Předměty
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    school_id INTEGER REFERENCES schools(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Přiřazení učitelů k předmětům v rámci tříd
CREATE TABLE teacher_assignments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, teacher_id, subject_id)
);

-- Evaluace
CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Přístupové kódy pro evaluace
CREATE TABLE access_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(6) UNIQUE NOT NULL CHECK (code ~ '^[A-Z0-9]{6}$'),
    evaluation_id INTEGER REFERENCES evaluations(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Odpovědi na hodnocení předmětů a učitelů
CREATE TABLE evaluation_responses (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    access_code_id INTEGER NOT NULL REFERENCES access_codes(id) ON DELETE CASCADE,
    preparation_score INTEGER NOT NULL CHECK (preparation_score BETWEEN 1 AND 5),
    explanation_score INTEGER NOT NULL CHECK (explanation_score BETWEEN 1 AND 5),
    engagement_score INTEGER NOT NULL CHECK (engagement_score BETWEEN 1 AND 5),
    atmosphere_score INTEGER NOT NULL CHECK (atmosphere_score BETWEEN 1 AND 5),
    individual_score INTEGER NOT NULL CHECK (individual_score BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger pro aktualizaci časového razítka
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery pro aktualizaci časových razítek
CREATE TRIGGER update_teacher_assignments_updated_at
    BEFORE UPDATE ON teacher_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at
    BEFORE UPDATE ON evaluations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexy pro optimalizaci výkonu
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_classes_school ON classes(school_id);
CREATE INDEX idx_classes_director ON classes(director_id);

CREATE INDEX idx_teachers_school ON teachers(school_id);
CREATE INDEX idx_subjects_school ON subjects(school_id);

CREATE INDEX idx_teacher_assignments_class ON teacher_assignments(class_id);
CREATE INDEX idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX idx_teacher_assignments_subject ON teacher_assignments(subject_id);
CREATE INDEX idx_teacher_assignments_composite ON teacher_assignments(class_id, teacher_id, subject_id);

CREATE INDEX idx_evaluations_school ON evaluations(school_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);
CREATE INDEX idx_evaluations_dates ON evaluations(start_date, end_date);

CREATE INDEX idx_access_codes_evaluation ON access_codes(evaluation_id);
CREATE INDEX idx_access_codes_class ON access_codes(class_id);
CREATE INDEX idx_access_codes_used ON access_codes(is_used);

CREATE INDEX idx_evaluation_responses_teacher ON evaluation_responses(teacher_id);
CREATE INDEX idx_evaluation_responses_subject ON evaluation_responses(subject_id);
CREATE INDEX idx_evaluation_responses_class ON evaluation_responses(class_id);
CREATE INDEX idx_evaluation_responses_access_code ON evaluation_responses(access_code_id);
CREATE INDEX idx_evaluation_responses_composite ON evaluation_responses(teacher_id, subject_id, class_id); 