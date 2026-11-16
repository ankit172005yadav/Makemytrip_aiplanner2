const stop = (time,title,lat,lng,kind,duration,note) => ({time,title,lat,lng,kind,duration,note})
const day = (title,description,travel,stops) => ({title,description,travel,stops})
const makeGuide = guide => ({
    ...guide,
    link: '/inspiration/'+guide.id,
    count: guide.days.reduce((total,item)=>total+item.stops.length,0),
})

export const indiaGuides = [
    makeGuide({
        id:'jaipur', title:'Three days in Jaipur', location:'Jaipur, Rajasthan', cover:'/discovery/jaipur.jpg', tag:'Forts, bazaars and the Pink City',
        source:'https://www.incredibleindia.gov.in/en/rajasthan/jaipur.html',
        intro:'Start in the Pink City, spend a day in the hills around Amer, and finish with museums and markets. The days group nearby places so you can spend less time crossing Jaipur.',
        stay:'Stay around MI Road for easy access to the old city, or near Amer if you prefer a quieter base and expect to use taxis.',
        food:'Try a Rajasthani thali for lunch, then make time for a pyaaz kachori or a glass of lassi. Johari Bazaar and MI Road make convenient snack stops.',
        shopping:'Look for block printed textiles, lac bangles, and blue pottery. Compare a few shops before buying and ask whether fragile pieces can be packed for travel.',
        days:[
            day('Inside the Pink City','Explore the royal quarter on foot, with time for a lunch break between monuments.','The first three stops are near one another. Use an auto for the final leg if the streets feel busy.',[
                stop('09:00','Hawa Mahal',26.9239,75.8267,'Architecture','45 min','See the façade from across the street before heading inside. The ramps and small windows show how the building was designed.'),
                stop('10:15','City Palace',26.9258,75.8237,'Palace','90 min','Pick the courtyards and galleries you most want to see. Check which sections your ticket includes at the entrance.'),
                stop('12:15','Jantar Mantar',26.9248,75.8246,'Observatory','60 min','Follow the instruments from the smaller dials to the large sundial. A guide can help explain how to read the shadows.'),
                stop('16:00','Johari Bazaar',26.9212,75.8254,'Market','75 min','Browse jewelry and textiles along the main street and leave time to compare prices.'),
            ]),
            day('Amer and the hill forts','Give the fort complex most of the morning, then make two shorter stops on the way back.','Hire an auto or taxi for the day. The approach to Amer climbs and can be exposed in the afternoon.',[
                stop('08:30','Amer Fort',26.9855,75.8513,'Fort','2 hr','Start with the main courtyards, then work your way up to the mirror work and views over Maota Lake.'),
                stop('11:15','Jaigarh Fort',26.985,75.8456,'Fort','75 min','Walk the ramparts for views back toward Amer before returning to the lower road.'),
                stop('15:30','Jal Mahal viewpoint',26.9534,75.8467,'Viewpoint','30 min','See the water palace from the roadside promenade and take a break before heading back into Jaipur.'),
            ]),
            day('Museums, textiles and sunset','Keep the middle of the day flexible so you can linger in the museum or market.','Take an auto between the museum and market. Use a taxi for the hill road to Nahargarh and arrange the return.',[
                stop('09:30','Albert Hall Museum',26.9117,75.8195,'Museum','90 min','Start with the central galleries and leave time for the decorative arts.'),
                stop('12:30','Bapu Bazaar',26.9168,75.8245,'Market','75 min','Browse textiles and footwear after lunch, with time for a shorter loop if you are leaving the same day.'),
                stop('16:00','Nahargarh Fort',26.9374,75.8155,'Fort','90 min','Reach the hill before sunset to see the city in daylight. Check closing time before making the climb.'),
            ]),
        ],
    }),
    makeGuide({
        id:'ahmedabad', title:'Three days in Ahmedabad', location:'Ahmedabad, Gujarat', cover:'/discovery/ashram.webp', tag:'Old city walks, stepwells and street food',
        source:'https://www.incredibleindia.gov.in/en/gujarat/ahmedabad',
        intro:'Spend a day in the walled city, a second on the Sabarmati and the textile trail, and a third at a stepwell and the lakefront.',
        stay:'Choose a central base near the riverfront for easy trips to both banks. For early heritage walks, look near the walled city.',
        food:'Make time for a Gujarati thali, try khaman or handvo as a snack, and leave an evening for Manek Chowk.',
        shopping:'Browse textiles and embroidered goods around Law Garden and the old city. Ask about fabric and care before buying.',
        days:[
            day('A walk through the walled city','Start with the pols and temple streets, then come back for the city’s evening food market.','The old city stops are walkable. Use an auto back to the market after your afternoon break.',[
                stop('08:00','Swaminarayan Temple, Kalupur',23.0303,72.5928,'Temple','45 min','Start early and use the temple as an anchor for a short walk through the surrounding pols.'),
                stop('10:00','Jama Masjid',23.0245,72.5878,'Architecture','45 min','Look at the courtyard and carved columns. Be mindful of worship and posted visitor guidance.'),
                stop('11:15','Sidi Saiyyed Mosque',23.0271,72.5812,'Architecture','35 min','Spend time looking at the carved stone screens, then break for lunch nearby.'),
                stop('19:00','Manek Chowk',23.0232,72.5864,'Food market','75 min','Visit in the evening and share a few dishes instead of committing to one stall.'),
            ]),
            day('Gandhi, textiles and the river','Pair the ashram with a smaller museum stop and a walk in cooler evening light.','An auto is useful between the ashram and museum. Check museum entry arrangements before visiting.',[
                stop('09:00','Sabarmati Ashram',23.0607,72.5801,'Museum','90 min','See Hriday Kunj and the exhibits before taking a few minutes by the river.'),
                stop('11:30','Calico Museum of Textiles',23.0511,72.5908,'Museum','90 min','Check whether the museum requires a reservation. If entry is unavailable, extend your ashram visit and take a longer lunch break.'),
                stop('17:00','Sabarmati Riverfront',23.035,72.568,'Walk','60 min','Pick one section of the promenade rather than trying to cover the entire riverfront.'),
            ]),
            day('A stepwell, a lake and a market','Leave the centre early for Adalaj, then return to Ahmedabad for the lake and evening shopping.','Adalaj is outside the centre. Use a taxi for the longer first leg and allow extra time for traffic.',[
                stop('09:00','Adalaj Stepwell',23.1668,72.5801,'Architecture','70 min','Go down slowly and look back at the carved galleries from different levels.'),
                stop('15:00','Kankaria Lake',23.006,72.601,'Lake','90 min','Choose a short segment of the lakefront and stop for refreshments before leaving.'),
                stop('18:00','Law Garden Night Market',23.0296,72.5595,'Market','60 min','Browse embroidered textiles and accessories, and compare stalls before buying.'),
            ]),
        ],
    }),
    makeGuide({
        id:'hampi', title:'Three days among the ruins of Hampi', location:'Hampi, Karnataka', cover:'/discovery/hampi.jpg', tag:'Temple trails and boulder landscapes',
        source:'https://www.incredibleindia.gov.in/en/trips/trip-listing/excursion-to-rustic-hampi',
        intro:'Explore the sacred centre first, take a full day for the royal precincts, and finish at the Vittala complex. Begin early and leave a break for the hottest part of the day.',
        stay:'Look around Kamalapura for easy access to the southern monuments, or use Hosapete as a base if you want more transport and hotel options.',
        food:'Plan a proper lunch in Kamalapura or Hosapete. Carry water and a snack when walking between monuments, especially on the riverside trails.',
        shopping:'Browse small stalls around Hampi Bazaar for local crafts. Bring reusable water bottles and leave the archaeological sites as you found them.',
        days:[
            day('The sacred centre','Start at the active temple and explore the monuments clustered around the bazaar.','This is primarily a walking day. Paths are uneven and exposed, so wear shoes with grip.',[
                stop('08:00','Virupaksha Temple',15.335,76.46,'Temple','75 min','Start in the courtyards and pay attention to posted rules for worship areas.'),
                stop('09:45','Hampi Bazaar',15.3353,76.4641,'Heritage walk','45 min','Follow the old colonnaded street at a relaxed pace before the heat sets in.'),
                stop('16:15','Hemakuta Hill',15.3328,76.4595,'Viewpoint','70 min','Walk up for a view of the temple skyline and boulders. Take a well lit route back before dark.'),
            ]),
            day('The royal precincts','Group the enclosed monuments and royal platforms into one circuit.','Use an auto or taxi between the larger clusters and schedule lunch in Kamalapura.',[
                stop('08:30','Lotus Mahal',15.3219,76.4725,'Architecture','60 min','Allow time to walk the grounds of the Zenana Enclosure and look at the building from several angles.'),
                stop('09:45','Elephant Stables',15.3223,76.4744,'Architecture','45 min','Walk along the front of the arcade and notice how the domes change between chambers.'),
                stop('11:15','Hazara Rama Temple',15.321,76.469,'Temple','50 min','Take time with the carved panels before the midday break.'),
                stop('15:30','Mahanavami Dibba',15.3168,76.4743,'Historic site','60 min','Explore the platform and nearby Royal Enclosure as a single walk.'),
            ]),
            day('Vittala and the riverside','Use the cooler part of the day for the stone chariot and finish with a quieter temple stop.','Check which riverside paths are open and use the road if the river is high or the trail is slippery.',[
                stop('08:30','Vittala Temple',15.3438,76.4754,'Temple','2 hr','Leave time for the stone chariot and pillared halls. Follow on-site restrictions around the carved pillars.'),
                stop('11:15','King’s Balance',15.3429,76.4739,'Historic site','30 min','Make this a short stop close to Vittala before returning for lunch.'),
                stop('15:45','Achyutaraya Temple',15.3337,76.4696,'Temple','60 min','Take the approach through the old market street if conditions are suitable, then leave before dusk.'),
            ]),
        ],
    }),
]
