/**
 * Expected errors.
 *
 * An AppError's message is safe to show to the user. Anything that is NOT an
 * AppError is treated as unexpected: the user sees a general message with a
 * reference code, and the full details go to the log only.
 */
export class AppError extends Error {
  constructor(
    /** Message shown to the user. Must not contain private or technical details. */
    message: string,
    public readonly title = 'Something went wrong',
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class PermissionError extends AppError {
  constructor(message = 'You do not have permission to use this command.') {
    super(message, 'Permission denied');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'Please check your input');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'Not found');
  }
}

export class CooldownError extends AppError {
  constructor(public readonly secondsLeft: number) {
    super(
      `Please wait ${secondsLeft} second${secondsLeft === 1 ? '' : 's'} before using this command again.`,
      'Slow down',
    );
  }
}
