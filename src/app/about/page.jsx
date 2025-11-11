import React from "react";
import Hero from "@/components/about/Hero";
import Beginning from "@/components/about/Beginning";
import Spark from "@/components/about/Spark";
import Mission from "@/components/about/Mission";
import Plus from "@/components/about/Plus";
import Believe from "@/components/about/Believe";
import Execuse from "@/components/about/Execuse";
import Will from "@/components/about/Will";
import Program from "@/components/about/Program";
import Ready from "@/components/about/Ready";


const About = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Beginning />
      <Spark />
      <Mission />
      <Plus />
      <Believe />
      <Execuse />
      <Will />
      <Program />
      <Ready />
    </div>
  )
}

export default About;