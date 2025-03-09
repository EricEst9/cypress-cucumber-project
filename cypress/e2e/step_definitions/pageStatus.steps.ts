import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

let homepageLinks: string[] = [];
const criticalPages = [
  'https://www.demoblaze.com/cart.html',
  'https://www.demoblaze.com/index.html',
  'https://www.demoblaze.com/prod.html' 
];

When("they retrieve all links from the homepage", function() {
  homepageLinks = [...criticalPages];  
  cy.get('a').then($links => {
    $links.each((index, link) => {
      const href = link.getAttribute('href');
      if (href) {
        try {
          let cleanHref = href.trim();
          if (cleanHref.startsWith('@')) {
            cleanHref = cleanHref.substring(1);
          }          
          if (cleanHref !== '' && !cleanHref.startsWith('javascript:') && !cleanHref.startsWith('#')) {
            const absoluteUrl = new URL(cleanHref, Cypress.config('baseUrl') as string).href;            
            if (absoluteUrl.includes('demoblaze.com') && !homepageLinks.includes(absoluteUrl)) {
              homepageLinks.push(absoluteUrl);
            }          }
        } catch (error: any) {
          cy.log(`Error procesando URL: ${error.message}`);
        }
      }
    });
  });
});

Then("all links should return 200 or 30x status codes", function() {
  if (homepageLinks.length === 0) {
    return;
  }
    homepageLinks.forEach(url => {
    cy.request({
      url,
      failOnStatusCode: false
    }).then(response => {
      const validStatus = response.status === 200 || Math.floor(response.status / 100) === 3;
      expect(validStatus, `URL ${url} should return 200 or 30x status code`).to.be.true;
    });
  });
});

Then("no link should return 40x status codes", function() {
  if (homepageLinks.length === 0) {
    return;
  }  
  homepageLinks.forEach(url => {
    cy.request({
      url,
      failOnStatusCode: false
    }).then(response => {
      const invalidStatus = Math.floor(response.status / 100) === 4;
      expect(invalidStatus, `URL ${url} should not return 40x status code`).to.be.false;
    });
  });
}); 