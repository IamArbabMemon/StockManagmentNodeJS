import { salesRecordModel } from "../models/salesRecord.model.js";

const getGraphData = async( req, res) => { 
    try {
        const { month, year } = req.query;
    console.log("Received month:", month, "and year:", year);
        const numericMonth = parseInt(month); // month = 1 (Jan) to 12 (Dec)
        const numericYear = parseInt(year);
    
        if (!numericMonth || !numericYear) {
          return res.status(400).json({ error: 'Month and year are required and must be numbers' });
        }
    
        // const startDate = new Date(numericYear, numericMonth - 1, 1);
        // const endDate = new Date(numericYear, numericMonth, 1); // first day of next month
       
        const startDate = new Date(Date.UTC(numericYear, numericMonth - 1, 1)); // e.g., May 1, 2024
        const endDate = new Date(Date.UTC(numericYear, numericMonth, 1)); 
        console.log(startDate, endDate);
        const results = await salesRecordModel.aggregate([
          {
            $match: {
              saleDate: {
                $gte: startDate,
                $lt: endDate
              }
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
                gameName: '$gameName',
                productName: '$productName'
              },
              totalReceivedAmount: { $sum: '$recievedAmount' },
              totalCount: { $sum: 1 }
            }
          },
          {
            $sort: { '_id.date': 1 }
          }
        ]);
    
        res.json(results);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
      }
 }

// const getGraphData = async (req, res) => {
//     try {
//       const { month, year } = req.query;
//       const numericMonth = parseInt(month);
//       const numericYear = parseInt(year);
  
//       // 1. Input validation
//       if (isNaN(numericMonth) || isNaN(numericYear)) {
//         return res.status(400).json({ error: 'Month and year must be numbers' });
//       }
  
//       // 2. Check available data years
//       const availableYears = await salesRecordModel.aggregate([
//         { $group: { _id: { $year: "$saleDate" } } },
//         { $sort: { _id: 1 } }
//       ]);
  
//       // 3. Return early if no data exists for requested year
//       if (!availableYears.some(y => y._id === numericYear)) {
//         return res.json({
//           success: true,
//           message: `No data available for ${numericYear}. Existing data years: ${availableYears.map(y => y._id).join(', ')}`,
//           availableYears: availableYears.map(y => y._id),
//           data: []
//         });
//       }
  
//       // 4. Main query for existing year
//       const results = await salesRecordModel.aggregate([
//         {
//           $addFields: {
//             saleYear: { $year: "$saleDate" },
//             saleMonth: { $month: "$saleDate" }
//           }
//         },
//         { 
//           $match: { 
//             saleYear: numericYear,
//             saleMonth: numericMonth
//           } 
//         },
//         {
//           $group: {
//             _id: {
//               date: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
//               gameName: "$gameName",
//               productName: "$productName"
//             },
//             totalReceivedAmount: { $sum: "$recievedAmount" },
//             totalCount: { $sum: 1 }
//           }
//         },
//         { $sort: { "_id.date": 1 } }
//       ]);
  
//       res.json({
//         success: true,
//         month: numericMonth,
//         year: numericYear,
//         recordCount: results.length,
//         availableYears: availableYears.map(y => y._id),
//         data: results
//       });
  
//     } catch (err) {
//       console.error('Error:', err);
//       res.status(500).json({ 
//         success: false,
//         error: 'Server error',
//         details: process.env.NODE_ENV === 'development' ? err.message : undefined
//       });
//     }
//   };
 export {
    getGraphData
 }