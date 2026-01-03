import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    checkIn: {
      type: String, // Format: "HH:MM"
    },
    checkOut: {
      type: String, // Format: "HH:MM"
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day', 'leave'],
      default: 'absent',
    },
    hours: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

// Calculate hours automatically
attendanceSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const [inHour, inMinute] = this.checkIn.split(':').map(Number);
    const [outHour, outMinute] = this.checkOut.split(':').map(Number);
    
    const checkInMinutes = inHour * 60 + inMinute;
    const checkOutMinutes = outHour * 60 + outMinute;
    
    this.hours = Math.round((checkOutMinutes - checkInMinutes) / 60 * 100) / 100;
    
    // Set status based on hours
    if (this.hours >= 8) {
      this.status = 'present';
    } else if (this.hours >= 4) {
      this.status = 'half-day';
    }
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
