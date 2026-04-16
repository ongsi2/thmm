type Props = {
  language?: string;
  filename?: string;
  code: string;
};

export default function CodeBlock({ language, filename, code }: Props) {
  const lines = code.replace(/\n+$/, '').split('\n');

  const isCommentLine = (line: string) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) return true;
    if (trimmed.startsWith('<!--') || trimmed.startsWith('-->')) return true;
    return false;
  };

  return (
    <div className="rounded-xl overflow-hidden border border-neutral-800 bg-[#0b1120] shadow-lg shadow-black/10 my-6">
      {(filename || language) && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </span>
            {filename && (
              <span className="font-mono text-xs text-neutral-400">{filename}</span>
            )}
          </div>
          {language && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {language}
            </span>
          )}
        </div>
      )}
      <pre className="p-5 overflow-x-auto text-[13px] leading-[1.7] font-mono text-neutral-100">
        <code>
          {lines.map((line, i) => (
            <div
              key={i}
              className={isCommentLine(line) ? 'text-neutral-500 italic' : ''}
            >
              {line || '\u00A0'}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
