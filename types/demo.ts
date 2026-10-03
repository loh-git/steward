// Result of the seedDemo Server Action. Errors come back as values (not thrown) so a
// client component can show them without a try/catch that would also swallow the
// redirect() the action performs on success.
export type DemoActionState = { error: string } | null;

// Where a visitor lands once their demo account is ready.
export const DEMO_LANDING_PATH = "/dashboard";
