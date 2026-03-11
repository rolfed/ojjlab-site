// src/data/leads.ts

export interface StartLeadInput {
  firstName: string;
  lastName?: string | undefined;
  email: string;
  phone?: string | undefined;
  tags?: string[] | undefined;
  source?: string | undefined;
}

export interface StartLeadSuccessResponse {
  success: true;
  data: {
    accepted: true;
  };
}

export interface StartLeadErrorResponse {
  success: false;
  error: {
    code:
      | 'invalid_json'
      | 'invalid_request'
      | 'invalid_email'
      | 'invalid_phone'
      | 'method_not_allowed'
      | 'origin_not_allowed'
      | 'upstream_unavailable'
      | 'internal_error';
    message: string;
  };
}

export type StartLeadResponse =
  | StartLeadSuccessResponse
  | StartLeadErrorResponse;

export class StartLeadRequestError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code = 'request_failed', status = 0) {
    super(message);
    this.name = 'StartLeadRequestError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Data-layer function for submitting a lead to the Worker API.
 * Keeps transport concerns isolated from the view layer.
 */
export async function startLead(
  input: StartLeadInput,
  // TODO implement envs 
  apiBaseUrl = 'http://localhost:8787',
): Promise<StartLeadSuccessResponse> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/leads/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        tags: input.tags,
        source: input.source ?? 'ojjlab-website',
      }),
    });

    let json: StartLeadResponse | null = null;

    try {
      json = (await response.json());
    } catch {
      throw new StartLeadRequestError(
        'The server returned an invalid response.',
        'invalid_response',
        response.status,
      );
    }

    if (!response.ok || !json.success) {
      throw new StartLeadRequestError(
        !(json?.success)
          ? json.error.message
          : 'Failed to submit lead.',
        !(json?.success) ? json.error.code : 'request_failed',
        response.status,
      );
    }

    return json;
  } catch (error) {
    if (error instanceof StartLeadRequestError) {
      throw error;
    }

    throw new StartLeadRequestError(
      'Network error while submitting lead.',
      'network_error',
      0,
    );
  }
}
