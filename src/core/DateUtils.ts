import moment from 'moment';

export class DateUtils {
  stringTodata(date: string) {
    const momentObj = moment(date, 'DD-MM-YYYY')
      .format('DD-MM')
      .toString();
    return momentObj;
  }

  format(date: string, format: string) {
    const convertedDate = date.replace(` `, 'T') + `.000Z`;
    return moment(convertedDate).format(format);
  }
}
