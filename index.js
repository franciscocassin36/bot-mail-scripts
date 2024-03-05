const Imap = require("imap");
const { simpleParser } = require("mailparser");
const imapConfig = {};

const express = require("express");
const app = express();
const port = 3000;

const sinceDate = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format
console.log(sinceDate);
function readEmails() {
  const imap = new Imap(imapConfig);

  imap.once("ready", () => {
    imap.openBox("INBOX", false, (err, box) => {
      if (err) {
        console.error(err);
        return;
      }

      const searchCriteria = ["SINCE", sinceDate]; // Search for emails since today

      imap.search(searchCriteria, (err, results) => {
        if (err) {
          console.error(err);
          return;
        }

        const fetchOptions = { bodies: "" }; // Fetch only headers

        imap.fetch(results, fetchOptions, (err, messages) => {
          if (err) {
            console.error(err);
            return;
          }

          messages.forEach((message) => {
            const msgParts = Imap.parseHeader(message.parts[0].body);

            console.log(`From: ${msgParts.from[0].text}`);
            console.log(`Subject: ${msgParts.subject[0]}`);
            console.log("---"); // Separator between emails
          });

          imap.end(); // Close connection
        });
      });
    });
  });

  imap.once("error", (err) => {
    console.error(err);
  });

  imap.once("end", () => {
    console.log("Connection ended");
  });

  imap.connect();
}

readEmails();
