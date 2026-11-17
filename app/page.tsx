import { About } from "@/components/site/about"
import { Contact } from "@/components/site/contact"
import { Hero } from "@/components/site/hero"
import { Idea } from "@/components/site/idea"
import { Portfolio } from "@/components/site/portfolio"
import { Process } from "@/components/site/process"
import { SiteFooter } from "@/components/site/site-footer"
import { SiteHeader } from "@/components/site/site-header"

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Idea />
        <Portfolio />
        <Process />
        <About />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
