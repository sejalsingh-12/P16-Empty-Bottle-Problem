import {
  buildings,
  availabilityOptions,
  cleanlinessOptions,
  temperatureOptions,
  emptyFilters,
} from "./filterOptions";

// A small helper component for one dropdown
function FilterSelect({ label, name, value, options, onChange }) {
  return (
    <div className="filter-group">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SearchFilterBar({ filters, setFilters }) {
  // Runs whenever the user types or picks something
  function handleChange(event) {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  }

  function handleReset() {
    setFilters(emptyFilters);
  }

  return (
    <div className="filter-bar">
      <div className="filter-group filter-search">
        <label>Search</label>
        <input
          type="text"
          name="search"
          placeholder="Search by name, building or ID..."
          value={filters.search}
          onChange={handleChange}
        />
      </div>

      <FilterSelect label="Building" name="building" value={filters.building} options={buildings} onChange={handleChange} />
      <FilterSelect label="Availability" name="availability" value={filters.availability} options={availabilityOptions} onChange={handleChange} />
      <FilterSelect label="Cleanliness" name="cleanliness" value={filters.cleanliness} options={cleanlinessOptions} onChange={handleChange} />
      <FilterSelect label="Temperature" name="temperature" value={filters.temperature} options={temperatureOptions} onChange={handleChange} />

      <button className="btn btn-outline" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}
