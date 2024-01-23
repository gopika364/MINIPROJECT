const Order = require('../models/orderSchema')

const salesChart = async (req, res) => {
    try {
      const pipeline = [
        {
          $project: {
            month: { $month: '$date' } 
          }
        },
        {
          $group: {
            _id: '$month',
            ordersCount: { $sum: 1 }
          }
        }
      ];
  
      const ordersByMonth = await Order.aggregate(pipeline);
  
      const orderCountsArray = Array(12).fill(0);
  
      ordersByMonth.forEach(monthData => {
        const monthIndex = monthData._id - 1;
        orderCountsArray[monthIndex] = monthData.ordersCount;
      });
  
      res.json(orderCountsArray);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};



const salesChartDaily = async (req, res) => {
  try {
    const pipeline = [
      {
        $project: {
          day: { $dayOfMonth: '$date' },
          month: { $month: '$date' },
        },
      },
      {
        $group: {
          _id: { day: '$day', month: '$month' },
          ordersCount: { $sum: 1 },
        },
      },
    ];

    const ordersByDay = await Order.aggregate(pipeline);

    const orderCountsArray = Array(31).fill(0); // Assuming maximum 31 days in a month

    ordersByDay.forEach(dayData => {
      const dayIndex = (dayData._id.month - 1) * 31 + dayData._id.day - 1;
      orderCountsArray[dayIndex] = dayData.ordersCount;
    });

    res.json(orderCountsArray);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

  
module.exports={salesChart,salesChartDaily}