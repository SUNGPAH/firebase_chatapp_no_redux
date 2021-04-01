import React, {useEffect, useState} from 'react';

const EmployeeComp = React.memo(({employee, onUpdate}) => {
  console.log('employee comp');
  const updateHandler = data => onUpdate({...employee, ...data})

  return (<tr>
    <td>{employee.id}</td>  
    <td>
    <input 
      value={employee.firstName}
      onChange={(e) => updateHandler({firstName: e.target.value})}
    />
    </td>
    <td>
    <input 
      value={employee.lastName}
      onChange={(e) => updateHandler({lastName: e.target.value})}
    />
    </td>
  </tr>
  )
})

const Test = () => {

  const data = [
    {
      id: "1",
      firstName: "sungpah"
    },
    {
      id: "2",
      firstName: "sungpah2"
    }
  ]
  const [employees, setEmployees] = useState(data);

  const onChange = React.useCallback(updateEmployee => {
    const employeeIndex = employees.findIndex(emp => emp.id === updateEmployee.id)
    employees[employeeIndex] = updateEmployee;
    setEmployees([...employees]);
  });

  return <>
    <table>
      <thead>
        <tr>
          <th>1</th>
          <th>2</th>
          <th>3</th>
        </tr>
      </thead>

    <tbody>
    {
      employees.map(employee => 
        <EmployeeComp
          key={employee.id}
          employee={employee}
          onUpdate={onChange}
        />  
      )
    }
    </tbody>

    </table>
    
  </>

}


export default Test