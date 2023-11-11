"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHospitalEmailData = exports.parseUserEmailData = void 0;
const mail_config_1 = __importDefault(require("./mail.config"));
const sendEmail = (subject, data, toEmail) => {
    return new Promise((resolve, reject) => {
        const mailOptions = {
            from: process.env.MAIL_FROM_ADDRESS,
            to: toEmail,
            subject: subject,
            html: data,
        };
        mail_config_1.default.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Error sending mail:", error);
                reject(error);
            }
            else {
                resolve(true);
            }
        });
    });
};
const parseUserEmailData = (name, hospitalName, appointmentTitle, appointmentDescription, startFormattedTime, endFormattedTime, meetingLink, rescheduleLink) => {
    const userEmailContent = `
        <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1;">Appointment Approved</h1>
      
                    <p style="color: #333;">Dear ${name},</p>
      
                    <p style="color: #333;">
                    We are pleased to inform you that your appointment with ${hospitalName} has been successfully approved. This is a confirmation that your meeting is scheduled and ready to go.
                    </p>

                    <h3 style="color: #A67EF1;">Appointment Details</h3>
                      <span style="font-weight:bold">Title</span> <p>${appointmentTitle}</p>
                   <br/>
                     <span style="font-weight:bold">Description</span> <p>${appointmentDescription}</p>
                   <br/>
                      <span style="font-weight:bold">Date and Time</span> <p> ${startFormattedTime.dateMonthYear} (${startFormattedTime.hoursAndMinutes} - ${endFormattedTime.hoursAndMinutes}})</p>
                   <br/>
                       <a href=${meetingLink} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Join Meeting</a>
                   <br/>
                    <span>Or copy this link ${meetingLink} and paste it to your browser to join the meeting</span>

                   <h4 style="color: #A67EF1;">Important Information</h4>

                   <p> Please be sure to arrive on time for your appointment. If you have any questions or need to reschedule, please don't hesitate reschedule to a later date or time </p>
                   <br/>
                    <a href=${rescheduleLink} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Reschedule Appointment</a>
                   <br/>
                    <span>Or copy this link ${rescheduleLink} and paste it to your browser to reschedule the appointment</span>

                    <br/>

                    <p style="color: #333;">Thank you for choosing Caresync.</p>
                </div>

      `;
    return userEmailContent;
};
exports.parseUserEmailData = parseUserEmailData;
const parseHospitalEmailData = (userName, hospitalName, appointmentTitle, appointmentDescription, startFormattedTime, endFormattedTime, hospitalMeetingLink, hospitalRescheduleLink) => {
    const hospitalEmailContent = `
        <div style="background-color: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);">
      
                    <h1 style="color: #A67EF1;">Appointment Approved</h1>
      
                    <p style="color: #333;">Dear ${hospitalName},</p>
      
                    <p style="color: #333;">
                    You recently approved ${userName}'s appointment. This is a confirmation that your meeting is scheduled and ready to go.
                    </p>

                    <h3 style="color: #A67EF1;">Appointment Details</h3>
                      <span style="font-weight:bold">Title</span> <p>${appointmentTitle}</p>
                   <br/>
                     <span style="font-weight:bold">Description</span> <p>${appointmentDescription}</p>
                   <br/>
                      <span style="font-weight:bold">Date and Time</span> <p> ${startFormattedTime.dateMonthYear} (${startFormattedTime.hoursAndMinutes} - ${endFormattedTime.hoursAndMinutes}})</p>
                   <br/>
                       <a href=${hospitalMeetingLink} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Join Meeting</a>
                   <br/>
                    <span>Or copy this link ${hospitalMeetingLink} and paste it to your browser to join the meeting</span>

                   <h4 style="color: #A67EF1;">Important Information</h4>

                   <p> Please be sure to arrive on time for your appointment. If you have any questions or need to reschedule, please don't hesitate reschedule to a later date or time </p>
                   <br/>
                    <a href=${hospitalRescheduleLink} style="display: inline-block; margin: 20px 0; padding: 10px 20px; background-color: #A67EF1; color: #fff; text-decoration: none; border-radius: 4px;">Reschedule Appointment</a>
                   <br/>
                    <span>Or copy this link ${hospitalRescheduleLink} and paste it to your browser to reschedule the appointment</span>

                    <br/>

                    <p style="color: #333;">Thank you for choosing Caresync.</p>
                </div>

      `;
    return hospitalEmailContent;
};
exports.parseHospitalEmailData = parseHospitalEmailData;
exports.default = sendEmail;
