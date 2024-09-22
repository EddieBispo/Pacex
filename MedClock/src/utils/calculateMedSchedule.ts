// src/utils/calculateMedSchedule.ts
export const calculateMedSchedule = (startTime: string, interval: number, duration: number) => {
    const schedules: string[] = [];
    const startDate = new Date();
    
    // Separar a hora e o minuto da string startTime (ex: "08:00")
    const [startHour, startMinute] = startTime.split(':').map(Number);
    startDate.setHours(startHour, startMinute, 0, 0);
  
    const intervalInMs = interval * 60 * 60 * 1000; // Converter intervalo de horas para milissegundos
    const durationInMs = duration * 24 * 60 * 60 * 1000; // Converter duração de dias para milissegundos
  
    let currentDate = startDate.getTime();
    const endDate = startDate.getTime() + durationInMs;
  
    // Gerar os horários a partir do início até o fim da duração
    while (currentDate <= endDate) {
      const time = new Date(currentDate);
      const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      schedules.push(formattedTime);
      currentDate += intervalInMs;
    }
  
    return schedules;
  };
  