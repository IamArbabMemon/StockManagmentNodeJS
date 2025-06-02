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
       
// approved

        const startDate = new Date(Date.UTC(numericYear, numericMonth - 1, 1)); // e.g., May 1, 2024
        const endDate = new Date(Date.UTC(numericYear, numericMonth, 1)); 
        console.log(startDate, endDate);
        const results = await salesRecordModel.aggregate([
          {
            $match: {
              saleDate: {
                $gte: startDate,
                $lt: endDate
              },

              status: 'approved' // Ensure only approved records are considered

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

 const getGraphDataOnMonth = async(req, res) => { 
  try {
      const { month, year } = req.query;
      console.log("Received month:", month, "and year:", year);
      const numericMonth = parseInt(month); // month = 1 (Jan) to 12 (Dec)
      const numericYear = parseInt(year);
  
      if (!numericMonth || !numericYear) {
          return res.status(400).json({ error: 'Month and year are required and must be numbers' });
      }
  
      const startDate = new Date(Date.UTC(numericYear, numericMonth - 1, 1));
      const endDate = new Date(Date.UTC(numericYear, numericMonth, 1)); 
      console.log(startDate, endDate);
      
      const results = await salesRecordModel.aggregate([
          {
              $match: {
                  saleDate: {
                      $gte: startDate,
                      $lt: endDate
                  },
                  status: 'approved'
              }
          },
          {
              $group: {
                  _id: {
                      gameName: '$gameName',
                      productName: '$productName'
                  },
                  totalReceivedAmount: { $sum: '$recievedAmount' },
                  totalCount: { $sum: 1 }
              }
          },
          {
              $sort: { '_id.gameName': 1, '_id.productName': 1 }
          }
      ]);
  
      res.json(results);
     // res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
  }
}

 export {
    getGraphData,
    getGraphDataOnMonth
 }