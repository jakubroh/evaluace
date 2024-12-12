import React from 'react';
import { useForm } from 'react-hook-form';

interface EvaluationFormData {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface EvaluationFormProps {
  evaluation?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  } | null;
  onSubmit: (data: EvaluationFormData) => void;
  onCancel: () => void;
}

export const EvaluationForm: React.FC<EvaluationFormProps> = ({
  evaluation,
  onSubmit,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<EvaluationFormData>({
    defaultValues: evaluation ? {
      ...evaluation,
      startDate: new Date(evaluation.startDate).toISOString().split('T')[0],
      endDate: new Date(evaluation.endDate).toISOString().split('T')[0]
    } : {
      name: '',
      startDate: '',
      endDate: '',
      isActive: true
    }
  });

  const startDate = watch('startDate');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Název evaluace
        </label>
        <input
          type="text"
          {...register('name', { required: 'Název je povinný' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Datum začátku
        </label>
        <input
          type="date"
          {...register('startDate', { required: 'Datum začátku je povinné' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.startDate && (
          <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Datum konce
        </label>
        <input
          type="date"
          {...register('endDate', {
            required: 'Datum konce je povinné',
            validate: value => !startDate || new Date(value) >= new Date(startDate) || 'Datum konce musí být po datu začátku'
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.endDate && (
          <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          {...register('isActive')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Aktivní
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Zrušit
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {evaluation ? 'Uložit změny' : 'Vytvořit evaluaci'}
        </button>
      </div>
    </form>
  );
}; 