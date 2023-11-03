export function formatDateTime(dateTimeString: Date) {
  const date = new Date(dateTimeString);

  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are 0-based, so add 1
  const year = date.getFullYear();

  // Ensure that day and month are zero-padded if they are single digits
  const formattedDate = `${day.toString().padStart(2, "0")}/${month
    .toString()
    .padStart(2, "0")}/${year}`;

  // Rest of the formatting remains the same
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const ampm = date.getHours() >= 12 ? "pm" : "am";

  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes();

  const formattedDateTime = `${day} ${
    months[month - 1]
  } ${year}, ${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  const dateMonthYear = `${day} ${months[month - 1]} ${year}`;
  const hoursAndMinutes = `${hours}:${minutes
    .toString()
    .padStart(2, "0")} ${ampm}`;

  return {
    dateMonthYear,
    hoursAndMinutes,
    formattedDateTime,
    formattedDate,
    day,
    month,
    year,
    hours,
    minutes,
    ampm,
  };
}


export function toJavaScriptDate(mongodbTimestamp: any) {
  // Parse the MongoDB timestamp into a JavaScript Date object.
  const date = new Date(mongodbTimestamp);

  return date;
}
