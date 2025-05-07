const HowItWorks = () => {
  const steps = [
    {
      icon: "ri-store-2-line",
      title: "Find Local Stores",
      description: "Discover pharmacies near you with the medications you need."
    },
    {
      icon: "ri-medicine-bottle-line",
      title: "Check Availability",
      description: "Verify if your medications are in stock before visiting."
    },
    {
      icon: "ri-shopping-bag-line",
      title: "Order & Pickup",
      description: "Place your order online and pick up at your convenience."
    }
  ];

  return (
    <div className="py-12 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-heading font-bold text-neutral-900">How MediFind Works</h2>
          <p className="mt-4 text-lg text-neutral-600">Find and order medications in three simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div className="text-center" key={index}>
              <div className="w-16 h-16 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                <i className={`${step.icon} text-2xl text-primary-500`}></i>
              </div>
              <h3 className="mt-6 text-lg font-heading font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
