const option = (title,kind,lat,lng,duration,note) => ({title,kind,lat,lng,duration,note})

export const replacementPlaces = {
    jaipur: [
        option('Galta Ji Temple','Temple',26.9172,75.8595,'75 min','Explore the hillside courtyards and water tanks. Allow extra travel time from the Pink City.'),
        option('Anokhi Museum of Hand Printing','Museum',26.9894,75.8514,'60 min','Explore block-printed textiles in the restored haveli. Check opening hours before making the trip to Amer.'),
        option('Panna Meena ka Kund','Stepwell',26.9887,75.8519,'30 min','View the geometric stairways from the perimeter and follow local access rules.'),
    ],
    ahmedabad: [
        option('Hutheesing Jain Temple','Temple',23.0426,72.5896,'45 min','Look for the carved marble details and follow posted rules for worship and photography.'),
        option('Gujarat Science City','Science museum',23.0798,72.4998,'2 hr','Pick a few galleries for a shorter visit and allow extra time to get there from the city centre.'),
        option('Kochrab Ashram','Historic site',23.0158,72.5585,'60 min','Take time to read about the early years of Gandhi’s work in Ahmedabad.'),
    ],
    hampi: [
        option('Krishna Temple','Temple',15.3301,76.4605,'45 min','Look for the carvings and the old market street in front of the complex.'),
        option('Badavilinga Temple','Temple',15.3278,76.4616,'30 min','Make this a short stop near the Lakshmi Narasimha monument.'),
        option('Archaeological Museum, Kamalapura','Museum',15.3037,76.4741,'75 min','Look through the sculpture galleries for context before or after visiting the ruins.'),
    ],
}
