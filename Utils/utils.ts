import {driver} from "@wdio/globals";




export async function sendKeys(selector: any, value: string) {
 try {
   // Wait for element
   await driver.execute('flutter:waitFor',selector,10000);
   await driver.execute('flutter:clickElement', selector, {timeout:5000});
   await driver.pause(500);
   await driver.execute('flutter:enterText',value);
   return true
   }


   catch (err: any) {


   console.warn(`SendKeys failed: ${err.message}`);
   throw err;
   //return false;
 }
}

export async function click(selector: any) {
 try {
   // Wait for element
   await driver.execute('flutter:waitFor',selector,10000);
   await driver.execute('flutter:clickElement', selector, {timeout:5000});
   return true
   } 
    catch (err: any) {
    console.warn(`Click failed: ${err.message}`);
    throw err;
    //return false;
 }
}