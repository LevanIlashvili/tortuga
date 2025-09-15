export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Tortuga
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Real Estate Tokenization on Hedera
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/properties"
            className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            View Properties
          </a>
          <a
            href="/dashboard"
            className="text-sm font-semibold leading-6 text-foreground"
          >
            Dashboard <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
