export namespace FormConstants{

  export const EVENTS = {
    FORM_UPDATED:"FORM_UPDATED"
  };
  export const RENAME_VALIDATION_MESSAGES = {
    NAME: [
      { type: 'required', message: 'Name is required' },
      { type: 'pattern', message: 'Enter a Valid Name' },
      { type: 'minlength', message: 'Name is too short' },
      { type: 'maxlength', message: 'Name is too long , max : 100 characters' }
    ]
  };

}
