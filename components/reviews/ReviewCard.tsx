import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Rating from '@/components/reviews/Rating';
import Comment from '@/components/reviews/Comment';

type ReviewCardProps = {
    reviewInfo: {
        comment: string;
        name: string;
        image: string;
        rating: number;
    };
    children?: React.ReactNode;
};

const ReviewCard = ({
    reviewInfo: { comment, name, image, rating },
    children,
}: ReviewCardProps) => {
    return (
        <Card className="relative">
            <CardHeader>
                <div className="flex items-center">
                    <img
                        src={image}
                        alt="profile"
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-4">
                        <h3 className="text-sm font-bold mb-1">{name}</h3>
                        <Rating rating={rating} />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Comment comment={comment} />
            </CardContent>
            {/*    delete button */}
            <div className="absolute top-3 right-3">{children}</div>
        </Card>
    );
};

export default ReviewCard;
