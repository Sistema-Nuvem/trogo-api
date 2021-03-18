import moment from 'moment';
import * as yup from 'yup';

export const momentDate = (parseFormat = 'YYYY-MM-DD') => yup.string()
  .nullable()
  .length(parseFormat.length)
  .test(`is-date_${parseFormat}`, 
    '${path} \'${value}\' is not a valid date'+`: ${parseFormat}`, 
    value => !value || moment(value, parseFormat, true).isValid()
  )
