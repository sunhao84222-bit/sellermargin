type DisclaimerBoxProps = {
  title: string;
  body: string;
};

export default function DisclaimerBox({ title, body }: DisclaimerBoxProps) {
  return (
    <aside className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{body}</p>
    </aside>
  );
}
