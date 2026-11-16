const cdn = 'https://d3fphkxyf5o5bm.cloudfront.net/image-resize/format=webp,w=720/';
const rows = [
 ['in-L3d715dZ','3 Day Guide to Lisbon From Someone That Lives There','Lisbon, Portugal','taliamazepa',73,38.72,-9.14,cdn+'https://images.unsplash.com/photo-1525207934214-58e69a8f8a3e?fit=max&w=1080'],
 ['in-afN75Eb4','Exploration: Skyline - Woodside + Beyond','San Francisco Peninsula, California','thesanfranciscopeninsula',23,37.43,-122.26,cdn+'https://images.mindtrip.ai/attractions/2ab6/007d/5da9/bf93/c4c8/377a/cbe0/a653'],
 ['in-ZAJDSZx0','Exploration: Coastside - Half Moon Bay','San Francisco Peninsula, California','thesanfranciscopeninsula',34,37.46,-122.43,'https://cdn.sanity.io/images/cpvxwd28/production/f7f9d17c5987dfbacff1da95a35530c4314510b2-6000x4000.jpg?fm=webp&w=720'],
 ['in-VKFiM8QI','German Christmas markets: Düsseldorf + small town day trips','Düsseldorf, Germany','wheresemmanow',31,51.23,6.77,cdn+'https://tcdn.mindtrip.ai/images/by-user/m08PUNKQHMe5LTbt9UbhyaR24sU2/boards/11769/xgnxq8-05bc252d-4a3a-4015-9b32-db3a7daaacd7.jpg'],
 ['in-LMmqrTzW','Croatian Christmas Markets: Zagreb','Zagreb, Croatia','wheresemmanow',15,45.81,15.98,cdn+'https://tcdn.mindtrip.ai/images/by-user/m08PUNKQHMe5LTbt9UbhyaR24sU2/boards/45799/f5abcl-d934dbb2-759b-433f-ba36-24acd5d7f227.jpg'],
 ['in-UBno8UsK','London Beyond the Postcard','London, England','travelswithmissworldwide',24,51.51,-.13,cdn+'https://images.mindtrip.ai/ugc/inspirations/94740/we7CqA0P6LTOA8iO.JPG'],
 ['in-OGYQxuZ9','London Again: Deeper Cuts From a Local','London, England','nicoleladonne',49,51.51,-.13,cdn+'https://images.mindtrip.ai/ugc/inspirations/62579/Fx5q5MCqQHWq0qUl.JPG'],
 ['in-5o3gy6Q8','5 Days in Taipei','Taipei, Taiwan','andrercarrillo',52,25.04,121.56,'https://cdn.sanity.io/images/cpvxwd28/production/2bbccb362cdeac7a49e773268cb088d0f67de84b-3575x5362.jpg?fm=webp&w=720'],
 ['in-XS1zrIxl','Milan','Milan, Italy','theitinerarygal',26,45.46,9.19,cdn+'https://images.unsplash.com/photo-1610016302534-6f67f1c968d8?fit=max&w=1080'],
 ['in-3SvNadH8','Best Restaurants in Barcelona','Barcelona, Spain','robbie_travels',13,41.39,2.17,cdn+'1abTdDbfQOKDVM93z44dLgd4SNBdMUU2x796wOGi'],
];
const slugs=['earth_americas-3-day-guide-lisbon-from-someone-lives','exploration-skyline-woodside-beyond','exploration-coastside-half-moon-bay','de-german-christmas-markets-dusseldorf-small-town-day-trips','hr-croatian-christmas-markets-zagreb-hr','london-beyond-postcardlove_letter','london-again-deeper-cuts-from-local','5-days-taipei','milan','best-restaurants-barcelona'];
export const guides = rows.map(([id,title,location,author,count,lat,lng,image],i)=>({id,title,location,author,count,lat,lng,image,cover:'/discovery/'+id+'.webp',source:'https://mindtrip.ai/inspiration/'+slugs[i]+'/'+id,link:'/inspiration/'+slugs[i]+'/'+id}));
const places = [
 ['ashram','Sabarmati Ashram','Experiences',23.0607,72.5801,'4.6','QwRY54Li1HMwD7oNfobdqULFGLfj7TD6cE1uPZQI8a'],
 ['lake','Kankaria Lake','Experiences',23.006,72.601,'4.5','QwRY54Li1HMwD7oNfpyTXlHV9sVhqXEIWPPQpDUQNw'],
 ['mosque','Sidi Saiyyed Mosque','Experiences',23.0271,72.5812,'4.5','QwRY54Li1HMwD7oNfq26uGxNPlN48IK0RalAeMceSY'],
 ['museum','Calico Museum of Textiles','Experiences',23.0511,72.5908,'','QwRY54Li1HMwD7oNfpA5NHKWdOMBXgta7OO5LeU0i6'],
 ['market','Manek Chowk Food Market','Restaurants',23.0232,72.5864,'',''],
 ['hotel','Taj Skyline Ahmedabad','Stays',23.0325,72.4819,'',''],
 ['city','Ahmedabad','Locations',23.026,72.566,'',''],
];
export const explorePlaces = places.map(([id,title,category,lat,lng,rating,key])=>({id,title,category,lat,lng,rating,location:'Ahmedabad, Gujarat',image:key?cdn+key:'',cover:key?'/discovery/'+id+'.webp':''}));
export const lisbonPlaces = [
 {title:'Miradouro de São Pedro de Alcântara',lat:38.7151,lng:-9.1441},
 {title:'Carmo Convent',lat:38.7121,lng:-9.1404},
 {title:'Belém Tower',lat:38.6916,lng:-9.216},
 {title:'Sintra National Palace',lat:38.797,lng:-9.3906},
];
