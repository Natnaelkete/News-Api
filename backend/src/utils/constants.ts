const NAME_REGEX = /^[A-Za-z][A-Za-z\s'-]{1,48}[A-Za-z]$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export { NAME_REGEX, PASSWORD_REGEX };
