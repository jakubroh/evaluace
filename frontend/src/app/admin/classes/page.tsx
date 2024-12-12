'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ClassList from '@/components/admin/ClassList';
import ClassForm from '@/components/admin/ClassForm';
import TeacherAssignmentForm from '@/components/admin/TeacherAssignmentForm';
import Modal from '@/components/common/Modal';

interface ClassFormData {
  name: string;
  schoolName: string;
  directorEmail: string;
}

interface Assignment {
  teacherId: number;
  subjectId: number;
}

export default function ClassesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { token } = useAuth();

  const handleCreateClass = async (data: ClassFormData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se vytvořit třídu');
      }

      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Chyba při vytváření třídy:', error);
      alert('Nepodařilo se vytvořit třídu');
    }
  };

  const handleEditClass = async (data: ClassFormData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/classes/${selectedClassId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Nepodařilo se upravit třídu');
      }

      setIsModalOpen(false);
      setSelectedClassId(undefined);
      window.location.reload();
    } catch (error) {
      console.error('Chyba při úpravě třídy:', error);
      alert('Nepodařilo se upravit třídu');
    }
  };

  const handleDeleteClass = async (classId: number) => {
    if (!confirm('Opravdu chcete smazat tuto třídu?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/classes/${classId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat třídu');
      }

      window.location.reload();
    } catch (error) {
      console.error('Chyba při mazání třídy:', error);
      alert('Nepodařilo se smazat třídu');
    }
  };

  const handleAssignTeachers = async (assignments: Assignment[]) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/classes/${selectedClassId}/assignments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ assignments }),
        }
      );

      if (!response.ok) {
        throw new Error('Nepodařilo se přiřadit učitele');
      }

      setIsAssignModalOpen(false);
      setSelectedClassId(undefined);
      window.location.reload();
    } catch (error) {
      console.error('Chyba při přiřazování učitelů:', error);
      alert('Nepodařilo se přiřadit učitele');
    }
  };

  const handleEdit = (classId: number) => {
    setSelectedClassId(classId);
    setIsModalOpen(true);
  };

  const handleAssign = (classId: number) => {
    setSelectedClassId(classId);
    setIsAssignModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Správa tříd</h1>
          <button
            onClick={() => {
              setSelectedClassId(undefined);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Přidat třídu
          </button>
        </div>

        <ClassList
          onEdit={handleEdit}
          onDelete={handleDeleteClass}
          onAssign={handleAssign}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedClassId(undefined);
          }}
          title={selectedClassId ? 'Upravit třídu' : 'Přidat novou třídu'}
        >
          <ClassForm
            classId={selectedClassId}
            onSubmit={selectedClassId ? handleEditClass : handleCreateClass}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedClassId(undefined);
            }}
          />
        </Modal>

        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedClassId(undefined);
          }}
          title="Přiřadit učitele k třídě"
        >
          {selectedClassId && (
            <TeacherAssignmentForm
              classId={selectedClassId}
              onSubmit={handleAssignTeachers}
              onCancel={() => {
                setIsAssignModalOpen(false);
                setSelectedClassId(undefined);
              }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
} 