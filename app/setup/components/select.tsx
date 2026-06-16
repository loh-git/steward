type SelectProps = {
  label: string;
  name: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string | number; label: string }[];
  hint?: string;
};

export default function Select({
  label,
  name,
  value,
  onChange,
  options,
  hint,
}: SelectProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{hint}</p>
      ) : null}
    </div>
  );
}
