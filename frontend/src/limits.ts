/**
 * Input bounds for the live AI console. Mirrors automation/limits.py on the
 * backend — keep the two in sync. The backend re-validates these, so the UI
 * caps are a convenience, not the security boundary.
 */
export const MAX_COMPANY_LEN = 200;
export const MAX_REQUEST_LEN = 4000;
