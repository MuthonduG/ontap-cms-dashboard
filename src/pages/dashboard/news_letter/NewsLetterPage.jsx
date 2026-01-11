import React from 'react'
import construction_gif  from '../../../assets/construction.gif'

const NewsLetterPage = () => {
  return (
    <section className="w-full flex flex-col justify-center items-center">
      <div className="rounded-full border border-amber-50">
        <img src={construction_gif} alt="" className="" />
      </div>
      <div className="flex flex-col justify-center items-center gap-6">
        <span className="font-semibold text-5xl">Page Under Construction</span>
        <span className="font-medium text-3xl text-gray-600">Come back soon</span>
      </div>
    </section> 
  )
}

export default NewsLetterPage
