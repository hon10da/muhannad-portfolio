// Add a project = add one object. Put images in public/images/projects/<slug>/
// Empty strings/arrays show a "needs asset" placeholder. Leave github/live "" until real.
export type Project = { id:string; name:string; categories:string[]; short:string; tools:string[]; thumbnail:string; cover:string; screenshots:string[]; github:string; live:string;
  overview:string; objective:string; contribution:string; features:string[]; notes?:string };
export const projectFilters = ["All Projects","Graphic Design","Frontend","Full Stack","UI/UX","AI / ML"];
export const projects: Project[] = [
  { id:"voltify", name:"Voltify", categories:["Frontend","Full Stack","UI/UX"], short:"Responsive e-commerce web app with product browsing, cart management and modern UI/UX.", tools:["React.js","Responsive Design","E-commerce","Vercel"],
    thumbnail:"", cover:"", screenshots:[], github:"", live:"",
    overview:"A fully responsive e-commerce platform built with React.js and deployed on Vercel.", objective:"Simplify the shopping process with a clear, modern interface.", contribution:"UI/UX design and frontend implementation: product browsing, cart management and user interaction features.", features:["Product browsing","Cart management","Responsive layout","Deployed on Vercel"] },
  { id:"flowtic", name:"Flowtic", categories:["Full Stack","UI/UX"], short:"Business management application concept covering sales, accounting, HR, inventory and dashboards.", tools:["Web technologies","Dashboards","Data visualization"],
    thumbnail:"", cover:"", screenshots:[], github:"", live:"",
    overview:"A business management web application supporting sales, accounting, HR and inventory operations.", objective:"Give teams one scalable, performant place to manage operations.", contribution:"Built the application and designed intuitive dashboards and interfaces.", features:["Sales","Accounting","HR","Inventory","Dashboards & data visualization"] },
  { id:"ddi", name:"Drug-Drug Interaction Detection (DDI)", categories:["AI / ML"], short:"Graduation project: AI-based detection of potential drug interactions using ML/deep learning.", tools:["Python","NumPy","Pandas","Scikit-learn","TensorFlow"],
    thumbnail:"", cover:"", screenshots:[], github:"", live:"",
    overview:"An AI-based system that predicts and classifies potential drug-drug interactions, using data preprocessing, feature engineering and model evaluation.", objective:"Improve healthcare decision support and patient safety.", contribution:"Machine learning / deep learning pipeline in Python.", features:["Data preprocessing","Feature engineering","Prediction & classification","Model evaluation"],
    notes:"DDI is a decision-support project. It does not replace medical professionals. Architecture, dataset and metrics will be added once documented." },
];
