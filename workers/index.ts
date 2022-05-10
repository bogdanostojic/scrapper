import { chromium } from 'playwright';
import mongoose from 'mongoose';
import path from 'path';
import { UserDocument } from './src/startup/models/user/schema/user';
import { User } from './src/startup/models/user/user.model';
import { connectionString } from './src/config/database';
import { amqplibConnection, getChannel } from './src/config/rabbitmq';

const consumeTask = async () => {
    await mongoose.connect(connectionString);
    await amqplibConnection()

    getChannel().consume('task', async msg => {
        if(!msg) {
            return;
        }
        const { email, password }  = JSON.parse(msg.content.toString('utf-8'));
        
        await (async () => {
            const browser = await chromium.launch({ headless: false });
            const context = await browser.newContext({ acceptDownloads: true })
            const page = await context.newPage();
            await page.goto(`https://www.glassdoor.com`);
    
            const signinbuttonclass = `.d-none .LockedHomeHeaderStyles__signInButton`;
            const signInPopup = `[name=emailSignInForm] button`
            await page.click(signinbuttonclass);
            await page.waitForSelector('#modalUserEmail')
    
            await page.type('#modalUserEmail', `${email}`);
            await page.type('#modalUserPassword', `${password}`);
            await page.click(signInPopup);

            const response =  await page.waitForResponse(`https://www.glassdoor.com/profile/ajax/loginSecureAjax.htm`)
            const body = await response.json()
            if(body.result !== 'success') {
                getChannel().ack(msg);
                const error = await (await page.$(`[name=emailSignInForm] #descriptionColor`))?.innerText()
                getChannel().sendToQueue('error',  Buffer.from(JSON.stringify({ email, password, error })), { persistent: true })
                await browser.close();
                return;
            }

            await page.waitForNavigation();
            await page.goto(`https://www.glassdoor.com/member/profile/index.htm`)
            await page.waitForTimeout(3000);
            const popups = await page.$$(`.BadgeModalStyles__closeBtn___3Uha1`)

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
            await download.saveAs(path.join(__dirname, `../api/downloads/resume/${email}.pdf`))
            const stream = await download.createReadStream();
            if(!stream) {
                await browser.close();
                return;
            }

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

              const details = {
                  about,
                  experience,
                  skills,
                  education,
                  certiciations
              }
              await User.findOneAndUpdate<UserDocument>({ email }, { resume: `http://localhost:3000/users/resume/${email}.pdf`, details }).exec()
              await browser.close()

              getChannel().ack(msg)
          })();

    }, { noAck: false})
}

consumeTask();