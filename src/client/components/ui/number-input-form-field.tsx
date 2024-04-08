import * as _ from 'lodash-es';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';

type NumberInputFormFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  name: Path<T>;
  min?: number;
  max?: number;
  step?: number;
};

export function NumberInputFormField<T extends FieldValues>({
  form,
  name,
  min,
  max,
  step,
}: NumberInputFormFieldProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{_.startCase(name)}</FormLabel>
          <FormControl>
            <Input
              type='number'
              min={min}
              max={max}
              step={step}
              className='w-48'
              {...form.register(name, { valueAsNumber: true })}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
