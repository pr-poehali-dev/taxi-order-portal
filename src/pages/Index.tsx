import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import YandexMap from '@/components/YandexMap';
import { api, type Driver, type Order } from '@/lib/api';



const Index = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('order');
  const [fromCoords, setFromCoords] = useState<number[] | null>(null);
  const [toCoords, setToCoords] = useState<number[] | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [driversData, ordersData] = await Promise.all([
        api.getDrivers(),
        api.getOrders()
      ]);
      setDrivers(driversData);
      setOrders(ordersData);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (!from || !to) return 0;
    return Math.floor(Math.random() * 300) + 250;
  };

  const handleAddressSelect = (address: string, coords: number[], isFrom: boolean) => {
    if (isFrom) {
      setFrom(address);
      setFromCoords(coords);
    } else {
      setTo(address);
      setToCoords(coords);
    }
  };

  const handleOrder = async () => {
    if (!selectedDriver) {
      toast({
        title: 'Выберите водителя',
        description: 'Пожалуйста, выберите водителя из списка',
        variant: 'destructive'
      });
      return;
    }

    try {
      const order = {
        driver_id: selectedDriver,
        passenger_name: 'Иван Петров',
        passenger_phone: '+7 (999) 123-45-67',
        from_address: from,
        to_address: to,
        from_latitude: fromCoords?.[0],
        from_longitude: fromCoords?.[1],
        to_latitude: toCoords?.[0],
        to_longitude: toCoords?.[1],
        price: estimatedPrice
      };

      await api.createOrder(order);
      
      toast({
        title: 'Заказ оформлен!',
        description: `Водитель ${drivers.find(d => d.id === selectedDriver)?.name} уже едет к вам`,
      });

      setFrom('');
      setTo('');
      setFromCoords(null);
      setToCoords(null);
      setSelectedDriver(null);
      
      loadData();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать заказ',
        variant: 'destructive'
      });
    }
  };

  const estimatedPrice = calculatePrice();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-8">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <Icon name="Car" size={24} className="text-primary-foreground" />
        </div>
        
        <nav className="flex flex-col gap-6 flex-1">
          <button
            onClick={() => setActiveTab('order')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'order' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon name="MapPin" size={22} />
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'history' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon name="History" size={22} />
          </button>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'profile' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon name="User" size={22} />
          </button>
          
          <button
            onClick={() => setActiveTab('support')}
            className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              activeTab === 'support' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            }`}
          >
            <Icon name="HeadphonesIcon" size={22} />
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex">
        <div className="w-[420px] bg-card border-r border-border overflow-y-auto">
          <div className="p-6">
            {activeTab === 'order' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-1">Заказ такси</h1>
                  <p className="text-sm text-muted-foreground">Укажите маршрут и выберите водителя</p>
                </div>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="Circle" size={12} className="text-primary" />
                        </div>
                        <Input
                          placeholder="Откуда"
                          value={from}
                          onChange={(e) => setFrom(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <Icon name="MapPin" size={14} className="text-destructive" />
                        </div>
                        <Input
                          placeholder="Куда"
                          value={to}
                          onChange={(e) => setTo(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {from && to && (
                      <div className="pt-3 border-t border-border animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">Примерная стоимость</span>
                          <span className="text-2xl font-semibold text-foreground">{estimatedPrice} ₽</span>
                        </div>
                        <Button className="w-full" size="lg" onClick={handleOrder}>
                          Заказать такси
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div>
                  <h2 className="text-sm font-medium text-foreground mb-3">Доступные водители</h2>
                  <div className="space-y-2">
                    {loading ? (
                      <div className="text-center py-8">
                        <Icon name="Loader2" size={24} className="animate-spin text-primary mx-auto" />
                      </div>
                    ) : drivers.map((driver) => (
                      <Card
                        key={driver.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedDriver === driver.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedDriver(driver.id)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {driver.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-foreground">{driver.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                <Icon name="Star" size={10} className="mr-1" />
                                {driver.rating}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{driver.car}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-primary">~ 3 мин</div>
                          </div>
                        </CardContent>
                      </Card>
                    )))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-1">История поездок</h1>
                  <p className="text-sm text-muted-foreground">Все ваши заказы</p>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8">
                      <Icon name="Loader2" size={24} className="animate-spin text-primary mx-auto" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Пока нет поездок
                    </div>
                  ) : orders.map((trip) => (
                    <Card key={trip.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Icon name="Calendar" size={14} className="text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{new Date(trip.created_at).toLocaleString('ru-RU')}</span>
                          </div>
                          <span className="text-lg font-semibold text-foreground">{trip.price} ₽</span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex items-start gap-2">
                            <Icon name="Circle" size={12} className="text-primary mt-1 flex-shrink-0" />
                            <span className="text-sm text-foreground">{trip.from_address}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Icon name="MapPin" size={12} className="text-destructive mt-1 flex-shrink-0" />
                            <span className="text-sm text-foreground">{trip.to_address}</span>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {trip.driver_name?.[0] || 'П'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{trip.driver_name || 'Водитель'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Icon
                                key={i}
                                name="Star"
                                size={14}
                                className={i < trip.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )))}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-1">Профиль</h1>
                  <p className="text-sm text-muted-foreground">Настройки аккаунта</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <Avatar className="h-20 w-20">
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                          ИП
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Иван Петров</h3>
                        <p className="text-sm text-muted-foreground">+7 (999) 123-45-67</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                        <Input type="email" placeholder="ivan.petrov@example.com" />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Телефон</label>
                        <Input type="tel" placeholder="+7 (999) 123-45-67" />
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Способы оплаты</h4>
                        <Card className="bg-muted/50">
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-card rounded flex items-center justify-center">
                              <Icon name="CreditCard" size={20} className="text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">•••• 4242</p>
                              <p className="text-xs text-muted-foreground">Visa</p>
                            </div>
                            <Badge variant="secondary">Основная</Badge>
                          </CardContent>
                        </Card>
                        <Button variant="outline" className="w-full">
                          <Icon name="Plus" size={16} className="mr-2" />
                          Добавить карту
                        </Button>
                      </div>

                      <Button className="w-full mt-6">Сохранить изменения</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-1">Поддержка</h1>
                  <p className="text-sm text-muted-foreground">Помощь и ответы на вопросы</p>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <Icon name="Phone" size={24} className="text-primary" />
                        <span className="text-sm font-medium">Позвонить</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <Icon name="MessageCircle" size={24} className="text-primary" />
                        <span className="text-sm font-medium">Написать</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <h2 className="text-sm font-medium text-foreground mb-3">Частые вопросы</h2>
                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="item-1" className="border rounded-lg px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        Как изменить способ оплаты?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Перейдите в раздел "Профиль", найдите блок "Способы оплаты" и нажмите "Добавить карту". Новую карту можно сделать основной.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2" className="border rounded-lg px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        Как отменить заказ?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Отменить заказ можно до того, как водитель начнёт движение к вам. В активном заказе нажмите кнопку "Отменить заказ".
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3" className="border rounded-lg px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        Где посмотреть историю поездок?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        Вся история поездок доступна в разделе "История" в боковом меню. Там вы найдёте детали каждой поездки.
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4" className="border rounded-lg px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        Как оценить поездку?
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        После завершения поездки появится экран с просьбой оценить водителя. Вы можете поставить оценку от 1 до 5 звёзд.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name="Info" size={20} className="text-primary-foreground" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">Служба поддержки</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Мы работаем круглосуточно, чтобы помочь вам
                        </p>
                        <p className="text-sm font-medium text-primary">8 (800) 555-35-35</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 relative">
          <YandexMap 
            drivers={drivers} 
            onAddressSelect={handleAddressSelect}
            fromCoords={fromCoords}
            toCoords={toCoords}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;