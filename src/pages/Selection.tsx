import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, GraduationCap, ArrowRight, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Selection = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <div className="w-full max-w-4xl">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-flex items-center gap-2 font-semibold text-xl mb-6">
                        <div className="gradient-primary p-2 rounded-lg">
                            <Code2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        TraceCode
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">Choose your path</h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Select how you'll be using TraceCode to get the best experience tailored to your needs.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {/* Personal Card */}
                    <Card
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 relative overflow-hidden"
                        onClick={() => navigate('/register?type=personal')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 text-center relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Personal</h2>
                            <p className="text-muted-foreground mb-8">
                                For individual learners looking to improve their coding skills with AI assistance.
                            </p>
                            <Button className="w-full group-hover:gradient-primary" variant="outline">
                                Continue as Personal
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Campus Card */}
                    <Card
                        className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 relative overflow-hidden"
                        onClick={() => navigate('/register')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 text-center relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <GraduationCap className="h-8 w-8 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Campus</h2>
                            <p className="text-muted-foreground mb-8">
                                For students and instructors part of a university or educational institution.
                            </p>
                            <Button className="w-full group-hover:gradient-primary" variant="outline">
                                Continue as Campus
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Selection;
