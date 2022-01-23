const sgMail = require('@sendgrid/mail')

// const sendgridAPIKey = "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"
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail= (email, name) => {
    sgMail.send({
        to : email,
        from : "rushi20111998@gmail.com",
        subject: "Welcome to the app!",
        text: `Welcome to the app, ${name}. Let me know how you get along with the app!`
    })
}

const sendCancellataionEmail = (email, name) => {
    sgMail.send({
        to : email,
        from : "rushi20111998@gmail.com",
        subject : `Goodbye ${name}!`,
        text: `Goodbye ${name}:(. I think the things din't go well!`
    })

}

module.exports = {
    sendWelcomeEmail, 
    sendCancellataionEmail
}