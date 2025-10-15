import React from "react";
import {
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section className="bg-gray-200 flex flex-col md:flex-row items-center md:h-screen px-4 sm:px-6 lg:px-10 py-10">
      <div className="space-y-5 w-full md:w-1/2">
        <p className="bg-green-500 mt-4 text-white flex items-center w-fit px-4 py-2 rounded-md text-sm">
          <ArrowTrendingUpIcon className="w-5 h-5 text-white mr-2" />
          Trusted by 10,000+ businesses
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-800 leading-tight">
          Complete Business <span className="text-green-600">Management</span>{" "}
          Solution
        </h1>

        <p className="text-base sm:text-lg md:text-2xl font-medium text-gray-600">
          Streamline your entire business with our all-in-one platform. Manage
          inventory, run your e-commerce store, schedule appointments, and track
          finances — all from one beautiful dashboard.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <p className="flex items-center text-gray-700">
            <UserGroupIcon className="w-8 h-8 text-green-600 mr-2" />
            10,000+ users
          </p>
          <p className="flex items-center text-gray-700">
            <ShieldCheckIcon className="w-8 h-8 text-green-600 mr-2" />
            Bank-level Security
          </p>
          <p className="flex items-center text-gray-700">
            <ArrowTrendingUpIcon className="w-8 h-8 text-green-600 mr-2" />
            99.9% Uptime
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-10">
          <Link to="/signup">
            <Button className="bg-green-500 text-white px-10 py-6 hover:bg-green-400 flex items-center justify-center gap-2">
              Start free trial <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </Link>
          <Link to="/features">
            <Button className="px-10 py-6 border border-gray-400 text-gray-200">
              Learn more
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>

      <div className="mt-10 md:mt-0 md:ml-10 w-full md:w-[60%]">
        <img
          src="https://preview--verdant-manage.lovable.app/assets/hero-dashboard-CKmWT72o.jpg"
          alt="Dashboard preview"
          className="rounded w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto"
        />
      </div>
    </section>
  );
}

export default HeroSection;
