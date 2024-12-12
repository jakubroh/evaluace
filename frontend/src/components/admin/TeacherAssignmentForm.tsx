import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Teacher {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Assignment {
  teacherId: number;
  subjectId: number;
}

interface TeacherAssignmentFormProps {
  classId: number;
  onSubmit: (assignments: Assignment[]) => void;
  onCancel: () => void;
}

export const TeacherAssignmentForm: React.FC<TeacherAssignmentFormProps> = ({
  classId,
  onSubmit,
  onCancel
}) => {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersResponse, subjectsResponse] = await Promise.all([
          fetch('/api/teachers', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('/api/subjects', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        if (!teachersResponse.ok || !subjectsResponse.ok) {
          throw new Error('Chyba při načítání dat');
        }

        const teachersData = await teachersResponse.json();
        const subjectsData = await subjectsResponse.json();

        setTeachers(teachersData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Chyba:', error);
      }
    };

    fetchData();
  }, [token]);

  const handleAddAssignment = () => {
    if (teachers.length > 0 && subjects.length > 0) {
      setAssignments([
        ...assignments,
        { teacherId: teachers[0].id, subjectId: subjects[0].id }
      ]);
    }
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleAssignmentChange = (index: number, field: keyof Assignment, value: number) => {
    const newAssignments = [...assignments];
    newAssignments[index] = {
      ...newAssignments[index],
      [field]: value
    };
    setAssignments(newAssignments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(assignments);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {assignments.map((assignment, index) => (
          <div key={index} className="flex gap-4 items-center">
            <select
              value={assignment.teacherId}
              onChange={(e) => handleAssignmentChange(index, 'teacherId', Number(e.target.value))}
              className="border rounded p-2 flex-1"
            >
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <select
              value={assignment.subjectId}
              onChange={(e) => handleAssignmentChange(index, 'subjectId', Number(e.target.value))}
              className="border rounded p-2 flex-1"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleRemoveAssignment(index)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Odebrat
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleAddAssignment}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Přidat přiřazení
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Uložit
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Zrušit
        </button>
      </div>
    </form>
  );
}; 