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
        className="w-full rounded border border-ink-200 bg-paper-card p-2"
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint ? (
        <p className="mt-0.5 text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}
