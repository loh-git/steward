type InputProps = {
  label: string;
  type: string;
  name: string;
  value?: string | number;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number | string;
  hint?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
};

export default function Input({
  label,
  type,
  name,
  value,
  checked,
  onChange,
  placeholder,
  className = "w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700",
  min,
  max,
  step,
  hint,
  inputMode,
  pattern,
}: InputProps) {
  const isCheckbox = type === "checkbox";
  const isNumberInput = type === "number";
  const resolvedStep = step ?? (isNumberInput ? "any" : undefined);

  if (isCheckbox) {
    return (
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked ?? false}
          onChange={onChange}
          className="mt-1 h-4 w-4 rounded border-zinc-300"
        />
        <div className="flex-1">
          <label htmlFor={name} className="text-sm font-medium">
            {label}
          </label>
          {hint ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} focus:outline-none focus:ring-2 focus:ring-blue-500`}
        min={min}
        max={max}
        step={resolvedStep}
        inputMode={inputMode ?? (isNumberInput ? "decimal" : undefined)}
        pattern={pattern}
      />
      {hint ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
