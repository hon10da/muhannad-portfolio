// Order here = order in the gallery. Add an image to public/images/designs/ then add one entry.
// placeholder:true marks sample slots (shown with a "Placeholder" badge). Remove it for real work.
export type Design = { id:string; title:string; category:string; image:string; description:string; tools:string[]; details?:string; placeholder?:boolean };
export const designCategories = ["All","Branding","Social Media","Banners","Promotional","UI/UX"];
export const designs: Design[] = [
  { id:"branding-01", title:"Branding project", category:"Branding", image:"/images/designs/branding-01.jpg", description:"Replace with a real brand identity.", tools:["Illustrator"], placeholder:true },
  { id:"social-01", title:"Social media set", category:"Social Media", image:"/images/designs/social-01.jpg", description:"Replace with real social posts.", tools:["Photoshop","Canva"], placeholder:true },
  { id:"banner-01", title:"Banner", category:"Banners", image:"/images/designs/banner-01.jpg", description:"Replace with a real banner.", tools:["Photoshop"], placeholder:true },
  { id:"promo-01", title:"Promotional creative", category:"Promotional", image:"/images/designs/promo-01.jpg", description:"Replace with a real promo piece.", tools:["Photoshop","Illustrator"], placeholder:true },
  { id:"ui-01", title:"UI/UX concept", category:"UI/UX", image:"/images/designs/ui-01.jpg", description:"Replace with a real UI/UX screen.", tools:["UI/UX"], placeholder:true },
];
