import amqplib from 'amqplib';
import { chromium } from 'playwright';
import mongoose from 'mongoose';
const base64ToPdfHeader = `data:application/pdf;base64,`
import path from 'path';
import { UserDocument } from './src/startup/models/user/schema/user';
import { User } from './src/startup/models/user/user.model';


const url =  process.env.DATABSE_URL || 'localhost';
const port =  process.env.DATABSE_PORT || '27017';
const database =  process.env.DATABSE_DB || 'test';


const connectionString = `mongodb://${url}:${port}/${database}`
export {
    url,
    port,
    database,
    connectionString
}
const consumeTask = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    await mongoose.connect(connectionString);
    const channel = await connection.createChannel();
    await channel.assertQueue('task', { durable: true });
    await channel.assertQueue('error', { durable: true });

    channel.prefetch(1);
    console.log('waiting for messages');
    
    
      console.log('heey')

    channel.consume('task', async msg => {
        if(!msg) {
            console.log('msg is null');
            console.log(msg)
            return;
        }
        const { email, password }  = JSON.parse(msg.content.toString('utf-8'));
        
        await (async () => {
            const browser = await chromium.launch({ headless: true });
            const context = await browser.newContext({ acceptDownloads: true })
            const page = await context.newPage();
            await page.goto(`https://www.glassdoor.com`);
    
            // await page.waitForNavigation();
            const signinbuttonclass = `.d-none .LockedHomeHeaderStyles__signInButton`;
            const signInPopup = `[name=emailSignInForm] button`
            await page.click(signinbuttonclass);
            // await page.evaluate((signinbuttonclass) => document.querySelector(signinbuttonclass).click(), signinbuttonclass)
            await page.waitForSelector('#modalUserEmail')
    
            await page.type('#modalUserEmail', `${email}`);
            await page.type('#modalUserPassword', `${password}`);
            await page.click(signInPopup);

            await page.waitForTimeout(2000);
            if( await (await page.$(`[name=emailSignInForm] #descriptionColor`))?.isVisible()) {
                channel.ack(msg);
                const error = await (await page.$(`[name=emailSignInForm] #descriptionColor`))?.innerText()
                channel.sendToQueue('error',  Buffer.from(JSON.stringify({ email, password, error })), { persistent: true })
                await browser.close();
                return;
            }
            // // await page.evaluate((t) => document.querySelector(t).click(), signInPopup);
            // const url = await page.url();

            // await page.waitForNavigation();
            await page.goto(`https://www.glassdoor.com/member/profile/index.htm`);
    
            const popups = await page.$$(`.BadgeModalStyles__closeBtn___3Uha1`);
    
            await Promise.all( popups.map( async ( p ) => {
                if(await p.isVisible()) {
                    await p.click();
                }
            }));
            const profilePageButtons = await page.$$(`.profileInfoStyle__actions___3-CvK .profileInfoStyle__actionBtn___2ectR`)

    
            const [ download ] = await Promise.all([
                page.waitForEvent('download'),
                profilePageButtons[1].click()
            ])
            await download.saveAs(path.join(__dirname, `./downloads/resume/${ email ? `${email}-${Date.now()}` : `${download.suggestedFilename().split('.pdf').join('')}-${Date.now()}`}.pdf`))
            const stream = await download.createReadStream();
            if(!stream) {
                await browser.close();
                return;
            }
            var bufs: any[] = [];
            stream.on('data', function(d){ bufs.push(d); });
            stream.on('end', async function(){
              var buf = Buffer.concat(bufs);
              console.log(Buffer.from(buf).toString('base64'));
              const resume = `${base64ToPdfHeader}${Buffer.from(buf).toString('base64')}`;

            const about = await (await page.$(`#AboutMe p`))?.innerText();

            const experiences = await ( await page.$$('#Experience li'))

            const experience = await Promise.all(experiences.map( async e => { 

                const expSelector = await e.$('.experienceStyle__entryBody___jKGL4');

                return {
                    title: await( await expSelector?.$('h3'))?.innerText(),
                    employer: await( await expSelector?.$('[data-test=employer]'))?.innerText(),
                    location: await( await expSelector?.$('[data-test=location]'))?.innerText(),
                    employmentPeriod: await( await expSelector?.$('[data-test=employmentperiod]'))?.innerText(),
                    description: await( await expSelector?.$('[data-test=description]'))?.innerText()
                }
            }))

            const skillsSelector = await ( await page.$$("[data-test=skillList] .css-zomrfc"));

            const skills = await Promise.all(skillsSelector.map( async skill => { 

                return await (await skill.$('.css-1p0oo7a'))?.innerText();
            }))


            const educationSelector = await ( await page.$$(".educationStyle__entryBody___Wn2xP"));


            const education = await Promise.all(educationSelector.map( async education => { 

                return {
                    university: await( await education?.$('[data-test=university]'))?.innerText(),
                    degree: await( await education?.$('[data-test=degree]'))?.innerText(),
                    location: await( await education?.$('[data-test=location]'))?.innerText(),
                    graduationDate: await( await education?.$('[data-test=graduationDate]'))?.innerText(),
                    description: await( await education?.$('[data-test=description]'))?.innerText(),
                }
            }))

            const certificatSelector = await ( await page.$$(".certificationStyle__entryBody___1f76-"));

            const certiciations = await Promise.all(certificatSelector.map( async education => { 

                return {
                    title: await( await education?.$('[data-test=title]'))?.innerText(),
                    employer: await( await education?.$('[data-test=employer]'))?.innerText(),
                    certificationperiod: await( await education?.$('[data-test=certificationperiod]'))?.innerText(),
                    description: await( await education?.$('[data-test=description]'))?.innerText(),
                }
            }))

            console.log(skills)

              const details = {
                  about,
                  experience,
                  skills,
                  education,
                  certiciations
              }
              await User.findOneAndUpdate<UserDocument>({ email }, { resume, details }).exec()
              await browser.close()

              channel.ack(msg)
            })
          })();
    


    }, { noAck: false})
}

consumeTask();