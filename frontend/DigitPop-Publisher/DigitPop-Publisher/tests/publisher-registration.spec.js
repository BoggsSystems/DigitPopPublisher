const puppeteer = require('puppeteer');

describe('DigitPop SSO Publisher Registration', () => {
  it('Visits the Registration Page and Submits', async () => {
    console.log('Launching browser...');
    //const browser = await puppeteer.launch({ headless: 'new' });
    const browser = await puppeteer.launch({headless: false, slowMo: 33});


    console.log('Opening new page...');
    const page = await browser.newPage();

    // Set up a request interceptor
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        // If the request is a POST request and it's going to the URL of your function,
        // you can try responding directly in the test
        if (request.method() === 'POST' && request.url().endsWith('/register')) {
            // This event will be triggered once the function sends a response
            request.respond({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Invalid input' }),
            });
        } else {
            // For all other requests, we'll let them proceed as normal
            request.continue();
        }
    });

    console.log('Going to registration page...');
    await page.goto('http://localhost:58134/register');

    console.log('Typing first name...');
    await page.type('input[formControlName="firstName"]', 'John');

    console.log('Typing last name...');
    await page.type('input[formControlName="lastName"]', 'Doe');

    console.log('Typing email...');
    await page.type('input[formControlName="email"]', 'johndoe@example.com');

    console.log('Typing phone...');
    await page.type('input[formControlName="phone"]', '1234567890');

    console.log('Clicking Next button...');
    await page.click('#step1Next');

    console.log('Typing company name...');
    await page.type('input[formControlName="companyName"]', 'Company Inc');

    console.log('Typing company address...');
    await page.type('input[formControlName="companyAddress"]', '123 Street, City, Country');

    console.log('Typing company website...');
    await page.type('input[formControlName="companyWebsite"]', 'www.companyinc.com');

    console.log('Selecting company type...');
    await page.click('mat-select[formControlName="companyType"]');
    await page.click('mat-option[value="corporation"]');

    console.log('Clicking Next button...');
    await page.waitForSelector('button[matStepperNext]');
    await page.click('#step2Next');


    console.log('Typing username...');
    await page.type('input[formControlName="username"]', 'testuser');

    console.log('Typing password...');
    await page.type('input[formControlName="password"]', 'password');

    console.log('Confirming password...');
    await page.type('input[formControlName="confirmPassword"]', 'password');

    console.log('Clicking Next button...');
    await page.click('#step3Next');

    console.log('Clicking Confirm and Register button...');
    await page.click('#register');

    // Listen for the response
    page.on('response', async (response) => {
      if (response.url().endsWith('/register')) {
          const data = await response.json();
          console.log('Response data:', data);
          // Check status code and error message
          if (response.status() === 400) {
              expect(data.error).toBe('Invalid input');
          } else if (response.status() === 201) {
              expect(data.message).toBe('Publisher registration created successfully');
          }
      }
  });

    console.log('Registration test complete.');
  }, 300000); // increase timeout to 30s
});
