# Stackline Full Stack Assignment

## Bugs fixed

- Search functionality was broken due to an unconfigured remote domain for images (images-na.ssl-images-amazon.com) 
   - Fixed by adding domain to remotePatterns in next.config.ts
- "Clear Filters" button does not reset category to "All Categories"
   - Fixed by adding "All Categories" and "All Subcategories" as selectable options in the dropdowns themselves, mapping the "all" value back to undefined in state.
- Subcategory filter displays all subcategories, not just subcategories mapped to the selected category
   - Fixed by adding the category query param to the subcategories API call
- Title is just "Create Next App"
   - Added "StackShop" as title for homepage, set title to product name on product pages

## Code quality improvements
- Product details are rendered via query string in the URL, causing long, non-shareable URLs and potentially causing security issues as a user could input any product details
   - Switched to a dynamic route /product/[sku] and querying API by sku
- No error handling on API calls, meaning that if a call fails the page will be in a stuck state
   - Implemented error handling for API calls, including displaying an error message on failed call
- API call is sent on every keystroke, increasing load on backend server and resulting in bad UX with multiple "Loading..." messages while typing
   - Added a 300ms debounce, eliminating unnecessary API calls

## Enhancements
- Implemented pagination in the UI, allowing the user to view all results returned by the API. The user can 


