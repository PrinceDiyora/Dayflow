import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'], // Format: "YYYY-MM"
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      houseRent: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      special: { type: Number, default: 0 },
    },
    totalAllowances: {
      type: Number,
      default: 0,
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    deductions: {
      providentFund: { type: Number, default: 0 },
      professionalTax: { type: Number, default: 0 },
      incomeTax: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    payDate: {
      type: Date,
    },
    payslipUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one payroll per employee per month
payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

// Calculate totals automatically
payrollSchema.pre('save', function (next) {
  // Calculate total allowances
  this.totalAllowances = 
    this.allowances.houseRent +
    this.allowances.medical +
    this.allowances.transport +
    this.allowances.special;

  // Calculate gross salary
  this.grossSalary = this.baseSalary + this.totalAllowances;

  // Calculate total deductions
  this.totalDeductions =
    this.deductions.providentFund +
    this.deductions.professionalTax +
    this.deductions.incomeTax +
    this.deductions.other;

  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;

  next();
});

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;
