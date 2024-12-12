interface EvaluationFormProps {
  teacherName: string;
  subjectName: string;
  onSubmit: (values: {
    teachingQuality: number;
    comprehensibility: number;
    gradingFairness: number;
    organization: number;
    engagement: number;
    comment: string;
  }) => void;
  isSubmitting: boolean;
}

export default function EvaluationForm({
  teacherName,
  subjectName,
  onSubmit,
  isSubmitting
}: EvaluationFormProps) {
  const [values, setValues] = useState({
    teachingQuality: 0,
    comprehensibility: 0,
    gradingFairness: 0,
    organization: 0,
    engagement: 0,
    comment: ''
  });

  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = [];
    
    // Kontrola, zda jsou vyplněna všechna hodnocení
    if (values.teachingQuality === 0) newErrors.push('Vyplňte kvalitu výuky');
    if (values.comprehensibility === 0) newErrors.push('Vyplňte srozumitelnost výkladu');
    if (values.gradingFairness === 0) newErrors.push('Vyplňte spravedlivost hodnocení');
    if (values.organization === 0) newErrors.push('Vyplňte organizaci výuky');
    if (values.engagement === 0) newErrors.push('Vyplňte zapojení studentů');
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(values);
  };

  const criteria = [
    {
      name: 'teachingQuality',
      label: 'Kvalita výuky',
      description: 'Jak hodnotíte celkovou kvalitu výuky?'
    },
    {
      name: 'comprehensibility',
      label: 'Srozumitelnost výkladu',
      description: 'Jak srozumitelně učitel vysvětluje látku?'
    },
    {
      name: 'gradingFairness',
      label: 'Spravedlivost hodnocení',
      description: 'Jak spravedlivě učitel hodnotí?'
    },
    {
      name: 'organization',
      label: 'Organizace výuky',
      description: 'Jak dobře je výuka organizována?'
    },
    {
      name: 'engagement',
      label: 'Zapojení studentů',
      description: 'Jak dobře učitel zapojuje studenty do výuky?'
    }
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {errors.length > 0 && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Opravte následující chyby:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Hodnocení učitele {teacherName} - předmět {subjectName}
            </h3>
            
            <div className="mt-6 space-y-6">
              {criteria.map(({ name, label, description }) => (
                <div key={name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {label}
                    </label>
                    <span className="text-sm text-gray-500">
                      {values[name] > 0 ? `${values[name]} z 5` : 'Nevyplněno'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{description}</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setValues({ ...values, [name]: rating })}
                        className={`relative inline-flex items-center justify-center flex-1 px-4 py-3 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                          ${values[name] === rating
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                  Slovní hodnocení (nepovinné)
                </label>
                <p className="text-sm text-gray-500">
                  Zde můžete napsat další postřehy nebo doporučení
                </p>
                <textarea
                  id="comment"
                  rows={4}
                  value={values.comment}
                  onChange={(e) => setValues({ ...values, comment: e.target.value })}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Odesílám...' : 'Odeslat hodnocení'}
        </button>
      </div>
    </form>
  );
} 