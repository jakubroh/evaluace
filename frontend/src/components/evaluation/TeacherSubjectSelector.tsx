interface Subject {
  id: number;
  name: string;
  classSubjectId: number;
  isCompleted: boolean;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  subjects: Subject[];
}

interface TeacherSubjectSelectorProps {
  teachers: Teacher[];
  onSelect: (classSubjectId: number) => void;
}

export default function TeacherSubjectSelector({ teachers, onSelect }: TeacherSubjectSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Vyberte učitele a předmět k hodnocení</h2>
        <p className="mt-1 text-sm text-gray-500">
          Pro každého učitele můžete hodnotit jeden nebo více předmětů
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">
                {teacher.lastName} {teacher.firstName}
              </h3>
              
              <div className="mt-4 space-y-3">
                {teacher.subjects.map((subject) => (
                  <button
                    key={subject.classSubjectId}
                    onClick={() => onSelect(subject.classSubjectId)}
                    disabled={subject.isCompleted}
                    className={`w-full inline-flex items-center justify-between px-4 py-2 border shadow-sm text-sm font-medium rounded-md
                      ${subject.isCompleted
                        ? 'border-green-300 text-green-700 bg-green-50 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                  >
                    <span>{subject.name}</span>
                    {subject.isCompleted && (
                      <span className="ml-2 text-green-600">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 