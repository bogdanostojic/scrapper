import amqplib from 'amqplib';
import puppeteer from 'puppeteer';
const base64ToPdfHeader = `data:application/pdf;base64,`
import path from 'path';

const downloadPath = path.resolve('./download');

const consumeTask = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('task', { durable: true });
    channel.prefetch(1);
    console.log('waiting for messages');
    
    await (async () => {
        const browser = await puppeteer.launch({ headless: false, args: ['--window-size=1920,1080'] });
        const page = await browser.newPage();
        let email,password;
        page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1
        })
        try {
            await page.goto('https://www.glassdoor.com');
            const signinbuttonclass = `button.LockedHomeHeaderStyles__signInButton`;
            const signInPopup = `[name=emailSignInForm] button`
            await page.evaluate((signinbuttonclass) => document.querySelector(signinbuttonclass).click(), signinbuttonclass)
            await page.waitForSelector('#modalUserEmail')

            await page.type('#modalUserEmail', `${email || 'ravi.van.test@gmail.com'}`);
            await page.type('#modalUserPassword', `${password || 'ravi.van.test@gmail.com'}`);
            await page.evaluate((t) => document.querySelector(t).click(), signInPopup);

            await page.waitForNavigation();
            await page.goto(`https://www.glassdoor.com/member/profile/index.htm`);

            const pdfPage = await browser.newPage();
            const r = await (await pdfPage.goto(`https://www.glassdoor.com/member/profile/resumePdf.htm`, { waitUntil: 'networkidle0'})).buffer;
            // const a  = await pdfPage.createPDFStream();
            console.log(r)

            console.log('done')
            // await page.hover(`[data-test=user-profile-dropdown-trigger]`);

            // other actions...
            await new Promise( r => setTimeout(r, 100000));
            console.log( 'done')
        } catch(error) {
            console.log(error)
        } finally {

            await browser.close();
        }

      })();

      console.log('heey')

    channel.consume('task', msg => {
        if(!msg) {
            console.log('msg is null');
            return;
        }
        const { email, password }  = JSON.parse(msg.content.toString('utf-8'));



    })
}

consumeTask();